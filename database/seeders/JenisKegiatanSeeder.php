<?php

namespace Database\Seeders;

use App\Models\JenisKegiatan;
use Illuminate\Database\Seeder;

class JenisKegiatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            ['nama' => 'Bongkar', 'slug' => 'bongkar'],
            ['nama' => 'Muat', 'slug' => 'muat'],
        ];

        foreach ($data as $item) {
            JenisKegiatan::create($item);
        }
    }
}
