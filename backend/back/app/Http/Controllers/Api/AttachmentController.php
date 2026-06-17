<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AttachmentController extends Controller
{
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'max:10240', // Max 10MB
                'mimes:jpg,jpeg,png,gif,webp,txt,pdf,json,md,html,css,js,ts,py,csv,xml',
            ],
        ]);

        $file = $request->file('file');
        
        // Generate a clean slugified name to avoid conflicts or security issues
        $extension = $file->getClientOriginalExtension();
        $originalName = $file->getClientOriginalName();
        $cleanName = Str::slug(pathinfo($originalName, PATHINFO_FILENAME));
        $fileName = $cleanName . '-' . time() . '-' . Str::random(6) . '.' . $extension;

        // Store the file in public attachments disk
        $path = $file->storeAs('attachments', $fileName, 'public');
        
        // Generate public URL
        $url = Storage::disk('public')->url($path);

        return response()->json([
            'name' => $originalName,
            'url' => $url,
            'type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
        ], 201);
    }
}
