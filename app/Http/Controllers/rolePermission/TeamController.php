<?php

namespace App\Http\Controllers\rolePermission;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class TeamController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string)$request->query('q', ''));
        $sort = $request->query('sort', 'nama_lengkap');
        $dir = $request->query('dir', 'asc');
        $perPage = (int) $request->query('perPage', 10);

        $users = User::query()
            ->when($q, fn($x) => $x->where('nama_lengkap', 'like', "%$q%")->orWhere('email', 'like', "%$q%"))
            ->with('roles:id,name')
            ->orderBy(in_array($sort, ['nama_lengkap', 'email', 'created_at']) ? $sort : 'nama_lengkap', $dir === 'desc' ? 'desc' : 'asc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Manajemen-pengguna/manajemen-tim', [
            'users' => $users,
            'filters' => ['q' => $q, 'sort' => $sort, 'dir' => $dir, 'perPage' => $perPage],
            'roles' => Role::orderBy('name')->get(['id', 'name']),
            'can' => [
                'create' => $request->user()->can('create users'),
                'edit' => $request->user()->can('edit users'),
                'delete' => $request->user()->can('delete users'),
            ],
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
        
        $data = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', "unique:users,email,{$user->user_id},user_id"],
            'roles' => ['array'],
            'roles.*' => ['integer', 'exists:roles,id'],
        ]);

        $user->update([
            'nama_lengkap' => $data['nama_lengkap'],
            'email' => $data['email'],
        ]);

        // Sync roles
        if (isset($data['roles'])) {
            $roles = Role::whereIn('id', $data['roles'])->get();
            $user->syncRoles($roles);
        }

        return back()->with('success', 'User berhasil diupdate');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent deleting manager role users
        if ($user->hasRole('manajer')) {
            return back()->with('error', 'Tidak dapat menghapus user dengan role manajer');
        }

        $user->delete();
        return back()->with('success', 'User berhasil dihapus');
    }
}
