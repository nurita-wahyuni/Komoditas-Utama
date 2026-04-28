<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('data_entries', function (Blueprint $table) {
            $table->enum('status', ['draft', 'submitted'])->default('draft')->after('keterangan');
            $table->index(['status', 'user_id'], 'idx_status_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data_entries', function (Blueprint $table) {
            $table->dropIndex('idx_status_user');
            $table->dropColumn('status');
        });
    }
};
