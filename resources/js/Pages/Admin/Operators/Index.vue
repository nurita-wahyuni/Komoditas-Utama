<script setup>
import BpsLayout from '@/Layouts/BpsLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';
import { ref } from 'vue';

const props = defineProps({
    operators: Array,
});

const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isResetModalOpen = ref(false);
const selectedOperator = ref(null);

const addForm = useForm({
    username: '',
    email: '',
    password: '',
});

const editForm = useForm({
    username: '',
    email: '',
    is_active: true,
});

const resetForm = useForm({
    password: '',
});

const openEditModal = (operator) => {
    selectedOperator.value = operator;
    editForm.username = operator.username;
    editForm.email = operator.email;
    editForm.is_active = operator.is_active;
    isEditModalOpen.value = true;
};

const openResetModal = (operator) => {
    selectedOperator.value = operator;
    resetForm.password = '';
    isResetModalOpen.value = true;
};

const submitAdd = () => {
    addForm.post(route('admin.operators.store'), {
        onSuccess: () => {
            isAddModalOpen.value = false;
            addForm.reset();
        },
    });
};

const submitEdit = () => {
    editForm.patch(route('admin.operators.update', selectedOperator.value.id), {
        onSuccess: () => {
            isEditModalOpen.value = false;
        },
    });
};

const submitReset = () => {
    resetForm.post(route('admin.operators.reset-password', selectedOperator.value.id), {
        onSuccess: () => {
            isResetModalOpen.value = false;
            resetForm.reset();
        },
    });
};

const deleteOperator = (id) => {
    if (confirm('Are you sure you want to delete this operator?')) {
        useForm({}).delete(route('admin.operators.destroy', id));
    }
};
</script>

<template>
    <Head title="Manage Operators" />

    <BpsLayout>
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-2xl font-bold text-gray-800">Manage Operators</h1>
            <button @click="isAddModalOpen = true" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                + Add Operator
            </button>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table class="w-full text-left">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</th>
                        <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                        <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="op in operators" :key="op.id" class="hover:bg-gray-50">
                        <td class="px-6 py-4 text-sm text-gray-800 font-medium">{{ op.username }}</td>
                        <td class="px-6 py-4 text-sm text-gray-600">{{ op.email }}</td>
                        <td class="px-6 py-4">
                            <span :class="[op.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700', 'px-2 py-1 text-xs font-bold rounded-full']">
                                {{ op.is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right space-x-2">
                            <button @click="openEditModal(op)" class="text-blue-600 hover:text-blue-800 text-sm font-semibold">Edit</button>
                            <button @click="openResetModal(op)" class="text-amber-600 hover:text-amber-800 text-sm font-semibold">Reset PW</button>
                            <button @click="deleteOperator(op.id)" class="text-red-600 hover:text-red-800 text-sm font-semibold">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Add Modal -->
        <div v-if="isAddModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                <h3 class="text-xl font-bold text-gray-800 mb-6">Add New Operator</h3>
                <form @submit.prevent="submitAdd" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Username</label>
                        <input v-model="addForm.username" type="text" class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                        <p v-if="addForm.errors.username" class="mt-1 text-xs text-red-600">{{ addForm.errors.username }}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <input v-model="addForm.email" type="email" class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                        <p v-if="addForm.errors.email" class="mt-1 text-xs text-red-600">{{ addForm.errors.email }}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Password</label>
                        <input v-model="addForm.password" type="password" class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                        <p v-if="addForm.errors.password" class="mt-1 text-xs text-red-600">{{ addForm.errors.password }}</p>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" @click="isAddModalOpen = false" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800">Cancel</button>
                        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700" :disabled="addForm.processing">Save</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Edit Modal -->
        <div v-if="isEditModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                <h3 class="text-xl font-bold text-gray-800 mb-6">Edit Operator</h3>
                <form @submit.prevent="submitEdit" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Username</label>
                        <input v-model="editForm.username" type="text" class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <input v-model="editForm.email" type="email" class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                    </div>
                    <div class="flex items-center space-x-3">
                        <input v-model="editForm.is_active" type="checkbox" id="is_active" class="rounded text-blue-600 focus:ring-blue-500">
                        <label for="is_active" class="text-sm font-medium text-gray-700">Account Active</label>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" @click="isEditModalOpen = false" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800">Cancel</button>
                        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700" :disabled="editForm.processing">Update</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Reset Password Modal -->
        <div v-if="isResetModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                <h3 class="text-xl font-bold text-gray-800 mb-6">Reset Password</h3>
                <form @submit.prevent="submitReset" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">New Password</label>
                        <input v-model="resetForm.password" type="password" class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" @click="isResetModalOpen = false" class="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800">Cancel</button>
                        <button type="submit" class="bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-700" :disabled="resetForm.processing">Reset</button>
                    </div>
                </form>
            </div>
        </div>
    </BpsLayout>
</template>
