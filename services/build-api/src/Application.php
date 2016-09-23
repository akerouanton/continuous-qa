<?php

declare(strict_types=1);

namespace App;

use App\Controller\CreateBuildController;
use App\Controller\GetBuildController;
use App\Controller\GetBuildHistoryController;
use App\Controller\UpdateAnalysisStateController;
use App\Service\BuildRepository;
use App\Service\ProjectRepository;
use IztokSvetik\SilexAmqp\Provider\AmqpServiceProvider;
use Silex\Application as BaseApplication;
use Silex\Provider\MonologServiceProvider;

final class Application extends BaseApplication
{
    const PROJECT_URN_REGEX = 'urn:gh:[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+';
    const BUILD_URN_REGEX = self::PROJECT_URN_REGEX.':\d+';

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
        $this->register(new AmqpServiceProvider(), [
            'amqp.connections' => [
                'default' => $this['config']['amqp'] + ['lazy' => true],
            ],
            'amqp.producers' => [
                'build' => [
                    'connection'       => 'default',
                    'exchange_options' => [
                        'name' => 'amq.topic',
                        'type' => 'topic',
                        'publish_attributes' => ['content_type' => 'application/json'],
                    ],
                ],
            ],
        ]);
        $this->register(new MonologServiceProvider());
        $this['monolog.handler'] = function () {
            return new \Monolog\Handler\ErrorLogHandler();
        };

        $this['mongo'] = self::share(function () {
            $config = $this['config']['mongo'];
            return (new \MongoDB\Client($config['uri']))->selectDatabase($config['database']);
        });
        $this['mongo.projects'] = self::share(function () {
            return $this['mongo']->selectCollection('projects');
        });
        $this['mongo.builds'] = self::share(function () {
            return $this['mongo']->selectCollection('builds');
        });

        $this['repository.build'] = self::share(function () {
            return new BuildRepository($this['mongo.builds'], $this['repository.project']);
        });
        $this['repository.project'] = self::share(function () {
            return new ProjectRepository($this['mongo.projects']);
        });

        $this->register(new \Silex\Provider\ServiceControllerServiceProvider());
        $this['controller.get_build'] = self::share(function () {
            return new GetBuildController($this['repository.build']);
        });
        $this['controller.create_build'] = self::share(function () {
            return new CreateBuildController($this['repository.build'], $this['amqp.producer']['build']);
        });
        $this['controller.get_build_history'] = self::share(function () {
            return new GetBuildHistoryController($this['repository.build']);
        });
        $this['controller.update_analysis_state'] = self::share(function () {
            return new UpdateAnalysisStateController($this['repository.build']);
        });
    }

    private function registerRoutes()
    {
        $this
            ->get('/builds/{projectUrn}', 'controller.get_build_history:getHistory')
            ->bind('get_build_history')
            ->addRequirements(['projectUrn' => self::PROJECT_URN_REGEX])
        ;
        $this
            ->post('/builds/{projectUrn}/new', 'controller.create_build:create')
            ->bind('create_build')
            ->after([$this['controller.create_build'], 'pushEvents'])
            ->addRequirements(['projectUrn' => self::PROJECT_URN_REGEX])
        ;
        $this
            ->get('/build/{buildUrn}', 'controller.get_build:get')
            ->bind('get_build')
            ->addRequirements(['buildUrn' => self::BUILD_URN_REGEX])
        ;
        $this
            ->patch('/build/{buildUrn}/{analyzer}', 'controller.update_analysis_state:update')
            ->bind('update_build_analysis')
            ->addRequirements([
                'buildUrn' => self::BUILD_URN_REGEX
            ])
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
