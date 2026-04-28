<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\DataEntry;
use App\Models\JenisKegiatan;
use App\Models\KategoriKapal;
use App\Models\Komoditas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EntryController extends Controller
{
    public function index()
    {
        return Inertia::render('Operator/Entries/Index', [
            'jenis_kegiatan' => JenisKegiatan::all(),
            'komoditas' => Komoditas::all(),
            'kategori_kapal' => KategoriKapal::all(),
        ]);
    }

    public function getTableData(Request $request)
    {
        $year = $request->get('tahun', date('Y'));
        $month = $request->get('bulan', date('n'));
        $user = Auth::user();

        $entries = DataEntry::where('user_id', $user->id)
            ->where('status', 'draft')
            ->where('tahun', $year)
            ->where('bulan', $month)
            ->with(['jenisKegiatan', 'komoditas', 'kategoriKapal'])
            ->get();

        $grouped = KategoriKapal::all()->map(function ($kategori) use ($entries) {
            return [
                'id' => $kategori->id,
                'nama' => $kategori->nama,
                'slug' => $kategori->slug,
                'entries' => $entries->where('kategori_kapal_id', $kategori->id)->values(),
            ];
        });

        return response()->json($grouped);
    }

    public function submitDrafts(Request $request)
    {
        $request->validate([
            'tahun' => 'required|integer',
            'bulan' => 'required|integer|between:1,12',
        ]);

        DB::transaction(function() use($request) {
            DataEntry::where('user_id', Auth::id())
                    ->where('status', 'draft')
                    ->where('tahun', $request->tahun)
                    ->where('bulan', $request->bulan)
                    ->update(['status' => 'submitted']);
        });

        return response()->json(['message' => 'All data submitted to admin!']);
    }

    public function submittedData(Request $request)
    {
        $year = $request->get('tahun', date('Y'));
        $month = $request->get('bulan', date('n'));

        $entries = DataEntry::where('user_id', Auth::id())
                       ->where('status', 'submitted')
                       ->where('tahun', $year)
                       ->where('bulan', $month)
                       ->with(['jenisKegiatan', 'komoditas', 'kategoriKapal'])
                       ->get();

        $grouped = KategoriKapal::all()->map(function ($kategori) use ($entries) {
            return [
                'id' => $kategori->id,
                'nama' => $kategori->nama,
                'slug' => $kategori->slug,
                'entries' => $entries->where('kategori_kapal_id', $kategori->id)->values(),
            ];
        });

        return response()->json($grouped);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tahun' => 'required|integer',
            'bulan' => 'required|integer|between:1,12',
            'jenis_kegiatan_id' => 'required|exists:jenis_kegiatan,id',
            'komoditas_id' => 'required|exists:komoditas,id',
            'kategori_kapal_id' => 'required|exists:kategori_kapal,id',
            'jumlah_massa' => 'required|numeric',
            'keterangan' => 'required|string',
        ]);

        $entry = DataEntry::create([
            'user_id' => Auth::id(),
            'tahun' => $request->tahun,
            'bulan' => $request->bulan,
            'jenis_kegiatan_id' => $request->jenis_kegiatan_id,
            'komoditas_id' => $request->komoditas_id,
            'kategori_kapal_id' => $request->kategori_kapal_id,
            'jumlah_massa' => $request->jumlah_massa,
            'satuan' => 'TON',
            'keterangan' => $request->keterangan,
            'status' => 'draft',
        ]);

        return response()->json($entry->load(['jenisKegiatan', 'komoditas', 'kategoriKapal']));
    }

    public function update(Request $request, DataEntry $entry)
    {
        $this->authorizeEntry($entry);

        $request->validate([
            'jenis_kegiatan_id' => 'sometimes|exists:jenis_kegiatan,id',
            'komoditas_id' => 'sometimes|exists:komoditas,id',
            'jumlah_massa' => 'sometimes|numeric',
            'keterangan' => 'sometimes|string',
        ]);

        $entry->update($request->all());

        return response()->json($entry->load(['jenisKegiatan', 'komoditas', 'kategoriKapal']));
    }

    public function destroy(DataEntry $entry)
    {
        $this->authorizeEntry($entry);
        $entry->delete();

        return response()->json(['success' => true]);
    }

    private function authorizeEntry(DataEntry $entry)
    {
        if ($entry->user_id !== Auth::id()) {
            abort(403);
        }
    }
}
