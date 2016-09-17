<?php

namespace App;

class JsonResponse extends \Symfony\Component\HttpFoundation\JsonResponse
{
    // Pretty-print + options from parent:
    // Encode <, >, ', &, and " for RFC4627-compliant JSON, which may also be embedded into HTML.
    // 15 === JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT
    protected $encodingOptions = JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT | JSON_PRETTY_PRINT;
}
