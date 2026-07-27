<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;

class AiHealthController extends Controller
{
    public function __invoke(GeminiService $gemini): JsonResponse
    {
        $health = $gemini->health();

        return response()->json($health, $health['reachable'] ? 200 : 503);
    }
}
