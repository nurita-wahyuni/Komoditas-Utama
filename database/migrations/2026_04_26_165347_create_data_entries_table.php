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
        Schema::create('data_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->year('tahun');
            $table->tinyInteger('bulan');
            $table->foreignId('jenis_kegiatan_id')->constrained('jenis_kegiatan')->onDelete('cascade');
            $table->foreignId('komoditas_id')->constrained('komoditas')->onDelete('cascade');
            $table->foreignId('kategori_kapal_id')->constrained('kategori_kapal')->onDelete('cascade');
            $table->decimal('jumlah_massa', 15, 2);
            $table->string('satuan')->default('TON');
            $table->string('keterangan'); // nama_kapal
            $table->timestamps();

            // Full indexes for performance
            $table->index(['tahun', 'bulan']);
            $table->index('user_id');
            $table->index('jenis_kegiatan_id');
            $table->index('komoditas_id');
            $table->index('kategori_kapal_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_entries');
    }
};
