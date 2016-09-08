<?php

declare(strict_types=1);

namespace App;

use App\Controller\CreateBuildController;
use App\Controller\GetBuildController;
use App\Controller\GetBuildHistoryController;
use IztokSvetik\SilexAmqp\Provider\AmqpServiceProvider;
use Silex\Application as BaseApplication;
use Silex\Provider\MonologServiceProvider;

final class Application extends BaseApplication
{
    const PROJECT_URN_REGEX = 'urn:gh:[a-zA-Z0-9-_]+/[a-zA-Z0-9-_]+';
    const BUILD_ID_REGEX = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

    public function __construct($debug = false, array $config)
    {
        parent::__construct();

        $this['debug']  = $debug;
        $this['config'] = $config;

        $this->registerServices();
        $this->registerRoutes();
        $this->registerErrorHandler();
    }

    private function registerServices()
    {
        $this->register(new \Silex\Provider\UrlGeneratorServiceProvider());

        $this->register(new AmqpServiceProvider(), [
            'amqp.connections' => [
                'default' => $this['config']['amqp'] + ['lazy' => true],
            ],
            'amqp.producers' => [
                'build' => [
                    'connection'       => 'default',
                    'exchange_options' => [
                        'name' => 'amq.direct',
                        'type' => 'direct',
                        'publish_attributes' => ['content_type' => 'application/json', 'delivery_mode' => 2],
                    ],
                ],
            ],
        ]);
        $this->register(new MonologServiceProvider());
        $this['monolog.handler'] = function () {
            return new \Monolog\Handler\ErrorLogHandler();
        };

        $this['mongo'] = self::share(function () {
            return (new \MongoDB\Client($this['config']['mongo']['uri']))
                ->selectDatabase($this['config']['mongo']['database'])
            ;
        });
        $this['mongo.build'] = self::share(function () {
            return $this['mongo']->selectCollection('build');
        });

        $this->register(new \Silex\Provider\ServiceControllerServiceProvider());
        $this['controller.get_build'] = self::share(function () {
            return new GetBuildController($this['mongo.build']);
        });
        $this['controller.create_build'] = self::share(function () {
            return new CreateBuildController(
                $this['mongo.build'],
                $this['amqp.producer']['build'],
                $this['url_generator']
            );
        });
        $this['controller.get_build_history'] = self::share(function () {
            return new GetBuildHistoryController($this['mongo.build']);
        });
    }

    private function registerRoutes()
    {
        $this
            ->get('/builds/{projectUrn}', 'controller.get_builds_history:getHistory')
            ->bind('get_build_history')
            ->addRequirements(['projectUrn' => self::PROJECT_URN_REGEX])
        ;
        $this
            ->get('/builds/{projectUrn}/{buildId}', 'controller.get_build:get')
            ->bind('get_build')
            ->addRequirements([
                'projectUrn' => self::PROJECT_URN_REGEX,
                'buildId'    => self::BUILD_ID_REGEX,
            ])
        ;

        $this
            ->post('/builds/{projectUrn}/new', 'controller.create_build:create')
            ->bind('create_build')
            ->addRequirements(['projectUrn' => self::PROJECT_URN_REGEX])
            ->after([$this['controller.create_build'], 'pushEvents'])
        ;
    }

    private function registerErrorHandler()
    {
        $handler = \Symfony\Component\Debug\ErrorHandler::register();

        $handler->throwAt(0, true);
        $handler->scopeAt(0, true);
        $handler->traceAt(E_ALL, true);
        $handler->setDefaultLogger($this['monolog'], E_ALL & ~E_USER_DEPRECATED);
    }
}
