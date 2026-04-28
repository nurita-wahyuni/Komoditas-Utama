<script setup>
import BpsLayout from '@/Layouts/BpsLayout.vue';
import { Head } from '@inertiajs/vue3';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const props = defineProps({
    jenis_kegiatan: Array,
    komoditas: Array,
    kategori_kapal: Array,
});

const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);
const groupedDrafts = ref([]);
const groupedSubmitted = ref([]);
const isLoading = ref(false);
const isSubmitting = ref(false);

const months = [
    { id: 1, nama: 'Januari' }, { id: 2, nama: 'Februari' }, { id: 3, nama: 'Maret' },
    { id: 4, nama: 'April' }, { id: 5, nama: 'Mei' }, { id: 6, nama: 'Juni' },
    { id: 7, nama: 'Juli' }, { id: 8, nama: 'Agustus' }, { id: 9, nama: 'September' },
    { id: 10, nama: 'Oktober' }, { id: 11, nama: 'November' }, { id: 12, nama: 'Desember' }
];

const totalDraftMassa = computed(() => {
    return groupedDrafts.value.reduce((acc, cat) => {
        return acc + cat.entries.reduce((sum, entry) => sum + parseFloat(entry.jumlah_massa || 0), 0);
    }, 0);
});

const loadData = async () => {
    isLoading.value = true;
    try {
        const [draftsRes, submittedRes] = await Promise.all([
            axios.get(route('operator.entries.table-data'), {
                params: { tahun: selectedYear.value, bulan: selectedMonth.value }
            }),
            axios.get(route('operator.entries.submitted-data'), {
                params: { tahun: selectedYear.value, bulan: selectedMonth.value }
            })
        ]);
        groupedDrafts.value = draftsRes.data;
        groupedSubmitted.value = submittedRes.data;
    } catch (error) {
        console.error('Error loading data:', error);
    } finally {
        isLoading.value = false;
    }
};

const addShip = async (kategoriId) => {
    console.log('addShip called with kategoriId:', kategoriId);
    console.log('props.jenis_kegiatan:', props.jenis_kegiatan);
    console.log('props.komoditas:', props.komoditas);

    if (!props.jenis_kegiatan || props.jenis_kegiatan.length === 0) {
        console.error('jenis_kegiatan is empty or undefined.');
        alert('Tidak dapat menambahkan kapal: Jenis kegiatan tidak tersedia.');
        return;
    }
    if (!props.komoditas || props.komoditas.length === 0) {
        console.error('komoditas is empty or undefined.');
        alert('Tidak dapat menambahkan kapal: Komoditas tidak tersedia.');
        return;
    }

    try {
        const response = await axios.post(route('operator.entries.store'), {
            tahun: selectedYear.value,
            bulan: selectedMonth.value,
            jenis_kegiatan_id: props.jenis_kegiatan[0].id,
            komoditas_id: props.komoditas[0].id,
            kategori_kapal_id: kategoriId,
            jumlah_massa: 1,
            keterangan: 'Kapal Baru',
            status: 'draft'
        });
        
        const kategori = groupedDrafts.value.find(k => k.id === kategoriId);
        if (kategori) {
            kategori.entries.push(response.data);
        }
    } catch (error) {
        console.error('Error adding ship:', error.response ? error.response.data : error.message);
        alert('Gagal menambahkan kapal. Silakan coba lagi.');
    }
};

const updateEntry = async (entry) => {
    try {
        await axios.patch(route('operator.entries.update', entry.id), {
            jenis_kegiatan_id: entry.jenis_kegiatan_id,
            komoditas_id: entry.komoditas_id,
            jumlah_massa: entry.jumlah_massa,
            keterangan: entry.keterangan
        });
    } catch (error) {
        console.error('Error updating entry:', error);
    }
};

const deleteEntry = async (kategoriId, entryId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    try {
        await axios.delete(route('operator.entries.destroy', entryId));
        const kategori = groupedDrafts.value.find(k => k.id === kategoriId);
        if (kategori) {
            kategori.entries = kategori.entries.filter(e => e.id !== entryId);
        }
    } catch (error) {
        console.error('Error deleting entry:', error);
    }
};

const submitAllDrafts = async () => {
    const shipCount = groupedDrafts.value.reduce((acc, cat) => acc + cat.entries.length, 0);
    if (shipCount === 0) return;
    if (!confirm(`Kirim ${shipCount} data kapal ke admin? Data yang sudah dikirim tidak dapat diubah kembali.`)) return;

    isSubmitting.value = true;
    try {
        await axios.post(route('operator.entries.submit-drafts'), {
            tahun: selectedYear.value,
            bulan: selectedMonth.value
        });
        alert('Semua data berhasil dikirim!');
        loadData();
    } catch (error) {
        console.error('Error submitting drafts:', error);
        alert('Gagal mengirim data.');
    } finally {
        isSubmitting.value = false;
    }
};

const getHeaderClass = (slug) => {
    switch (slug) {
        case 'luar-negeri': return 'bg-gradient-to-r from-blue-600 to-blue-400';
        case 'dalam-negeri': return 'bg-gradient-to-r from-emerald-600 to-emerald-400';
        case 'perintis': return 'bg-gradient-to-r from-orange-500 to-orange-400';
        case 'rakyat': return 'bg-gradient-to-r from-purple-600 to-purple-400';
        default: return 'bg-gray-600';
    }
};

onMounted(loadData);
</script>

<template>
    <Head title="Ship Entries" />

    <BpsLayout>
        <!-- Top Action Bar -->
        <div class="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 class="text-3xl font-black text-gray-900 tracking-tight">Entri Kapal</h1>
                <p class="text-gray-500 mt-1 font-medium">Kelola data operasional kapal secara real-time</p>
            </div>
            
            <div class="flex items-center space-x-6 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                <div class="flex items-center px-6 border-r border-gray-100">
                    <div class="text-right mr-4">
                        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Keseluruhan</p>
                        <p class="text-lg font-black text-blue-600 leading-none mt-1">{{ totalDraftMassa.toLocaleString() }} <span class="text-[10px] text-gray-400">TON</span></p>
                    </div>
                </div>
                <div class="flex items-center px-4 py-2 border-r border-gray-100">
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-widest mr-3">Periode</span>
                    <select v-model="selectedMonth" @change="loadData" class="border-none bg-transparent text-sm font-bold text-gray-700 focus:ring-0 p-0 pr-6 cursor-pointer">
                        <option v-for="m in months" :key="m.id" :value="m.id">{{ m.nama }}</option>
                    </select>
                    <span class="mx-2 text-gray-300">/</span>
                    <select v-model="selectedYear" @change="loadData" class="border-none bg-transparent text-sm font-bold text-gray-700 focus:ring-0 p-0 pr-6 cursor-pointer">
                        <option v-for="y in [2023, 2024, 2025, 2026]" :key="y" :value="y">{{ y }}</option>
                    </select>
                </div>
                <button 
                    @click="submitAllDrafts"
                    :disabled="isSubmitting || groupedDrafts.every(k => k.entries.length === 0)"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:shadow-none"
                >
                    <span>{{ isSubmitting ? 'Mengirim...' : 'Kirim Laporan' }}</span>
                    <svg v-if="!isSubmitting" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
            </div>
        </div>

        <div class="space-y-10">
            <!-- Entry Sections -->
            <div v-for="kategori in groupedDrafts" :key="'draft-' + kategori.id" class="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <!-- Section Header -->
                <div class="px-10 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50">
                    <div class="flex items-center space-x-5">
                        <div :class="[
                            'w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner',
                            kategori.slug === 'luar-negeri' ? 'bg-blue-50 text-blue-600' :
                            kategori.slug === 'dalam-negeri' ? 'bg-emerald-50 text-emerald-600' :
                            kategori.slug === 'perintis' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'
                        ]">
                            <svg v-if="kategori.slug === 'luar-negeri'" xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            <svg v-else-if="kategori.slug === 'dalam-negeri'" xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            <svg v-else-if="kategori.slug === 'perintis'" xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-xl font-black text-gray-800 uppercase tracking-tight">{{ kategori.nama }}</h3>
                            <p class="text-sm font-medium text-gray-400 mt-0.5">{{ kategori.entries.length }} Kapal dalam draft</p>
                        </div>
                    </div>
                    <button 
                        @click="addShip(kategori.id)"
                        class="inline-flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                        </svg>
                        <span>Tambah Kapal</span>
                    </button>
                </div>

                <!-- Table Area -->
                <div class="p-0">
                    <div v-if="kategori.entries.length > 0" class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-gray-50/50">
                                    <th class="pl-10 pr-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Nama Kapal</th>
                                    <th class="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Jenis Kegiatan</th>
                                    <th class="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Komoditas</th>
                                    <th class="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Jumlah / Massa</th>
                                    <th class="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Satuan</th>
                                    <th class="pr-10 pl-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                <tr v-for="entry in kategori.entries" :key="entry.id" class="group hover:bg-gray-50/50 transition-all duration-300">
                                    <td class="pl-10 pr-6 py-6">
                                        <div class="relative">
                                            <input 
                                                v-model="entry.keterangan" 
                                                @blur="updateEntry(entry)"
                                                type="text" 
                                                placeholder="Contoh: MV Sinar Jakarta"
                                                class="w-full border-2 border-transparent bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                                            >
                                        </div>
                                    </td>
                                    <td class="px-6 py-6">
                                        <select 
                                            v-model="entry.jenis_kegiatan_id" 
                                            @change="updateEntry(entry)"
                                            class="w-full border-2 border-transparent bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none cursor-pointer appearance-none"
                                        >
                                            <option v-for="jk in jenis_kegiatan" :key="jk.id" :value="jk.id">{{ jk.nama }}</option>
                                        </select>
                                    </td>
                                    <td class="px-6 py-6">
                                        <select 
                                            v-model="entry.komoditas_id" 
                                            @change="updateEntry(entry)"
                                            class="w-full border-2 border-transparent bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none cursor-pointer appearance-none"
                                        >
                                            <option v-for="k in komoditas" :key="k.id" :value="k.id">{{ k.nama }}</option>
                                        </select>
                                    </td>
                                    <td class="px-6 py-6">
                                        <div class="relative">
                                            <input 
                                                v-model="entry.jumlah_massa" 
                                                @blur="updateEntry(entry)"
                                                type="number" 
                                                class="w-full border-2 border-transparent bg-gray-50 rounded-xl px-4 py-3 text-sm font-black text-blue-600 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                                            >
                                        </div>
                                    </td>
                                    <td class="px-6 py-6">
                                        <span class="text-xs font-black text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">TON</span>
                                    </td>
                                    <td class="pr-10 pl-6 py-6 text-right">
                                        <button 
                                            @click="deleteEntry(kategori.id, entry.id)"
                                            class="p-2.5 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr class="bg-gray-50/30">
                                    <td colspan="3" class="pl-10 py-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Total Massa Kapal {{ kategori.nama }}</td>
                                    <td class="px-6 py-6">
                                        <span class="text-lg font-black text-gray-900">
                                            {{ kategori.entries.reduce((sum, e) => sum + parseFloat(e.jumlah_massa || 0), 0).toLocaleString() }}
                                        </span>
                                    </td>
                                    <td colspan="2" class="pr-10 py-6 text-sm font-black text-gray-400">TON</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div v-else class="flex flex-col items-center justify-center py-20 text-gray-300">
                        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H3m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p class="text-sm font-bold uppercase tracking-widest">Belum ada data kapal</p>
                        <button @click="addShip(kategori.id)" class="mt-4 text-blue-600 font-black text-xs uppercase hover:underline">Klik untuk menambah</button>
                    </div>
                </div>
            </div>

            <!-- Submitted Data (Summary Only) -->
            <div v-if="groupedSubmitted.some(k => k.entries.length > 0)" class="mt-20 border-t-2 border-dashed border-gray-200 pt-20">
                <div class="flex items-center justify-between mb-10">
                    <div>
                        <h2 class="text-2xl font-black text-gray-900 tracking-tight">Laporan Terkirim</h2>
                        <p class="text-gray-500 mt-1 font-medium">Data yang telah diverifikasi oleh sistem</p>
                    </div>
                    <div class="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center space-x-2">
                        <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        <span class="text-xs font-black text-blue-600 uppercase tracking-wider">Terkunci</span>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div v-for="kategori in groupedSubmitted" :key="'submitted-' + kategori.id" v-show="kategori.entries.length > 0" class="bg-white/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-100">
                        <div class="flex items-center justify-between mb-6">
                            <h4 class="font-black text-gray-800 uppercase text-sm tracking-widest">{{ kategori.nama }}</h4>
                            <span class="text-xs font-bold text-gray-400">{{ kategori.entries.length }} Kapal</span>
                        </div>
                        <div class="space-y-4">
                            <div v-for="entry in kategori.entries" :key="entry.id" class="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-50">
                                <div>
                                    <p class="text-sm font-black text-gray-800">{{ entry.keterangan }}</p>
                                    <p class="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{{ entry.jenis_kegiatan.nama }} • {{ entry.komoditas.nama }}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-sm font-black text-gray-900">{{ entry.jumlah_massa.toLocaleString() }}</p>
                                    <p class="text-[10px] font-bold text-gray-400 uppercase mt-0.5">TON</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </BpsLayout>
</template>

<style scoped>
select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0 center;
    background-size: 1rem;
    padding-right: 1.5rem;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
input[type=number] {
    -moz-appearance: textfield;
}
</style>
