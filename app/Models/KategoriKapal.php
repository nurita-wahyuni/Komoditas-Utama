<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KategoriKapal extends Model
{
    protected $table = 'kategori_kapal';
    protected $fillable = ['nama', 'slug'];

    public function dataEntries()
    {
        return $this->hasMany(DataEntry::class);
    }
}
