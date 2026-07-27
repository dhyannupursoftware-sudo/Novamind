<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->string('user_bubble_color', 7)->default('#303030');
            $table->string('user_text_color', 7)->default('#F7F7F8');
            $table->string('ai_accent_color', 7)->default('#10A37F');
            $table->string('chat_background_color', 7)->default('#212121');
            $table->string('sidebar_color', 7)->default('#171717');
            $table->string('header_color', 7)->default('#212121');
            $table->string('primary_color', 7)->default('#10A37F');
            $table->unsignedTinyInteger('font_size')->default(16);
            $table->string('font_family', 32)->default('Inter');
            $table->unsignedTinyInteger('border_radius')->default(18);
            $table->decimal('bubble_opacity', 3, 2)->default(0.96);
            $table->json('ui_preferences')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn([
                'user_bubble_color',
                'user_text_color',
                'ai_accent_color',
                'chat_background_color',
                'sidebar_color',
                'header_color',
                'primary_color',
                'font_size',
                'font_family',
                'border_radius',
                'bubble_opacity',
                'ui_preferences',
            ]);
        });
    }
};
