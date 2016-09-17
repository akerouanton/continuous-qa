<?php

namespace spec\App\Service;

use App\Model\Build;
use App\Service\BuildRepository;
use App\Service\ProjectRepository;
use MongoDB\Collection;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class BuildRepositorySpec extends ObjectBehavior
{
    function let(Collection $builds, ProjectRepository $projects)
    {
        $this->beConstructedWith($builds, $projects);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType(BuildRepository::class);
    }

    function it_creates_a_new_build($builds, $projects)
    {
        $projects->generateBuildId('urn:gh:knplabs/gaufrette')->willReturn(10);
        $builds->insertOne(Argument::that(function (Build $build) {
            return $build->getUrn() === 'urn:gh:knplabs/gaufrette:10';
        }))->shouldBeCalled();

        $this
            ->create('urn:gh:knplabs/gaufrette', 'https://github.com/knplabs/gaufrette', ['php-cs-fixer', 'phpqa'])
            ->shouldBeAnInstanceOf(Build::class);
        ;
    }
}
