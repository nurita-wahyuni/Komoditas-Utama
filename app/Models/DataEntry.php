<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DataEntry extends Model
{
    protected $table = 'data_entries';
    protected $fillable = [
        'user_id',
        'tahun',
        'bulan',
        'jenis_kegiatan_id',
        'komoditas_id',
        'kategori_kapal_id',
        'jumlah_massa',
        'satuan',
        'keterangan',
        'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function jenisKegiatan()
    {
        return $this->belongsTo(JenisKegiatan::class);
    }

    public function komoditas()
    {
        return $this->belongsTo(Komoditas::class);
    }

    public function kategoriKapal()
    {
        return $this->belongsTo(KategoriKapal::class);
    }
}
