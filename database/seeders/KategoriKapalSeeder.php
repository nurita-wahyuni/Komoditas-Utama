<?php

namespace Database\Seeders;

use App\Models\KategoriKapal;
use Illuminate\Database\Seeder;

class KategoriKapalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            ['nama' => 'Luar Negeri', 'slug' => 'luar-negeri'],
            ['nama' => 'Dalam Negeri', 'slug' => 'dalam-negeri'],
            ['nama' => 'Perintis', 'slug' => 'perintis'],
            ['nama' => 'Rakyat', 'slug' => 'rakyat'],
        ];

        foreach ($data as $item) {
            KategoriKapal::create($item);
        }
    }
}
