<?php

declare(strict_types=1);

namespace App\Exception;

final class AnalysisNotFoundException extends \RuntimeException
{
    public static function notFound(string $buildUrn, string $analyzer): AnalysisNotFoundException
    {
        return new self(sprintf('Unable to find the analysis "%s/%s".', $buildUrn, $analyzer));
    }
}
