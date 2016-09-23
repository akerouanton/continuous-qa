<?php

namespace App\Exception;

class BuildNotFoundException extends \RuntimeException
{
    public static function notFound(string $buildUrn): BuildNotFoundException
    {
        return new self(sprintf('Unable to find build "%s".', $buildUrn));
    }
}
