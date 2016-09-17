<?php

namespace spec\App\Service;

use App\Service\ProjectRepository;
use MongoDB\Collection;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class ProjectRepositorySpec extends ObjectBehavior
{
    function let(Collection $collection)
    {
        $this->beConstructedWith($collection);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType(ProjectRepository::class);
    }

    function it_generates_an_auto_incremented_build_id($collection)
    {
        $collection->findOneAndUpdate(
            ['urn' => 'urn:gh:knplabs/gaufrette'],
            ['$inc' => ['builds' => 1]],
            Argument::type('array')
        )->willReturn((object) ['builds' => 10]);

        $this->generateBuildId('urn:gh:knplabs/gaufrette')->shouldReturn(11);
    }

    function it_generates_build_one_for_new_project($collection)
    {
        $collection->findOneAndUpdate(
            ['urn' => 'urn:gh:knplabs/gaufrette'],
            ['$inc' => ['builds' => 1]],
            Argument::type('array')
        )->willReturn((object) ['builds' => null]);

        $this->generateBuildId('urn:gh:knplabs/gaufrette')->shouldReturn(1);
    }
}
