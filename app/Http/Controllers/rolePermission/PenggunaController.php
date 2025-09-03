<?php

namespace App\Http\Controllers\rolePermission;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;

class PenggunaController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['roles']);
        
        // Filter HANYA role penulis dan penerjemah
        $query->whereHas('roles', function($q) {
            $q->whereIn('name', ['penulis', 'penerjemah']);
        });
        
        // Search functionality
        if ($request->filled('q')) {
            $query->where('nama_lengkap', 'like', '%' . $request->q . '%')
                  ->orWhere('email', 'like', '%' . $request->q . '%');
        }
        
        // Sorting
        $sort = $request->get('sort', 'nama_lengkap');
        $dir = $request->get('dir', 'asc');
        $query->orderBy($sort, $dir);
        
        // Pagination
        $users = $query->paginate(10);
        
        // Hanya role penulis dan penerjemah yang ditampilkan
        $roles = Role::whereIn('name', ['penulis', 'penerjemah'])->get();
        
        // Permissions
        $can = [
            'create' => $request->user()->hasRole('manajer'),
            'edit' => $request->user()->hasRole('manajer'),
            'delete' => $request->user()->hasRole('manajer'),
        ];
        
        // Filters for frontend
        $filters = $request->only(['q', 'sort', 'dir', 'page']);

        return Inertia::render('Manajemen-pengguna/manajemen-pengguna', [
            'users' => $users,
            'roles' => $roles, // Hanya penulis dan penerjemah
            'filters' => $filters,
            'can' => $can,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'roles' => ['array'],
            'roles.*' => ['integer', 'exists:roles,id'],
        ]);
        
        // Validasi role hanya boleh penulis atau penerjemah
        $allowedRoles = Role::whereIn('name', ['penulis', 'penerjemah'])->pluck('id')->toArray();
        if (!empty(array_diff($data['roles'], $allowedRoles))) {
            return back()->withErrors(['roles' => 'Role yang dipilih tidak diizinkan']);
        }

        $user = User::create([
            'nama_lengkap' => $data['nama_lengkap'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        if (!empty($data['roles'])) {
            $roles = Role::whereIn('id', $data['roles'])->get();
            $user->assignRole($roles);
        }

        return back()->with('success', 'User berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        // Pastikan user yang diedit adalah penulis atau penerjemah
        if (!$user->hasAnyRole(['penulis', 'penerjemah'])) {
            return back()->withErrors(['user' => 'User tidak dapat diedit']);
        }
        
        $data = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $id],
            'roles' => ['array'],
            'roles.*' => ['integer', 'exists:roles,id'],
        ]);

        // Validasi role hanya boleh penulis atau penerjemah
        $allowedRoles = Role::whereIn('name', ['penulis', 'penerjemah'])->pluck('id')->toArray();
        if (!empty(array_diff($data['roles'], $allowedRoles))) {
            return back()->withErrors(['roles' => 'Role yang dipilih tidak diizinkan']);
        }

        $user->update([
            'nama_lengkap' => $data['nama_lengkap'],
            'email' => $data['email'],
        ]);

        if (isset($data['roles'])) {
            $roles = Role::whereIn('id', $data['roles'])->get();
            $user->syncRoles($roles);
        }

        return back()->with('success', 'User berhasil diupdate');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Pastikan user yang dihapus adalah penulis atau penerjemah
        if (!$user->hasAnyRole(['penulis', 'penerjemah'])) {
            return back()->withErrors(['user' => 'User tidak dapat dihapus']);
        }
        
        $user->delete();

        return back()->with('success', 'User berhasil dihapus');
    }
}
