<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JenisKegiatan extends Model
{
    protected $table = 'jenis_kegiatan';
    protected $fillable = ['nama', 'slug'];

    public function dataEntries()
    {
        return $this->hasMany(DataEntry::class);
    }
}
