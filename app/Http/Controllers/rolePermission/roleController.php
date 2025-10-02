<?php

namespace App\Http\Controllers\rolePermission;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\{Role, Permission};

class roleController extends Controller
{
    public function index(Request $request)
    {
        $q       = trim((string)$request->query('q', ''));
        $sort    = $request->query('sort', 'name');
        $dir     = $request->query('dir', 'asc');
        $perPage = (int) $request->query('perPage', 10);

        $roles = Role::query()
            ->when($q, fn($x) => $x->where('name', 'like', "%$q%"))
            ->withCount('permissions')
            ->orderBy(in_array($sort, ['name', 'guard_name', 'permissions_count', 'created_at']) ? $sort : 'name', $dir === 'desc' ? 'desc' : 'asc')
            ->paginate($perPage)
            ->withQueryString();


        return Inertia::render('Manajemen-pengguna/Manajemen-role/page', [
            'roles'      => $roles,
            'filters'    => ['q' => $q, 'sort' => $sort, 'dir' => $dir, 'perPage' => $perPage],
            'can'        => [
                'create' => $request->user()->can('create roles'),
                'edit'   => $request->user()->can('edit roles'),
                'delete' => $request->user()->can('delete roles'),
            ],
            'permissions' => Permission::orderBy('name')->get(['id', 'name']),

        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:roles,name'],
            'permissions' => ['array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role = Role::create(['name' => $data['name'], 'guard_name' => 'web']);

        // Assign permissions if provided
        if (!empty($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return back()->with('success', 'Role created successfully with permissions');
    }

    public function edit($id)
    {
        $role = Role::findOrFail($id);
        return Inertia::render('Manajemen-pengguna/Manajemen-role/edit-role', [
            'role'        => $role->load('permissions:id,name'),
            'permissions' => Permission::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:100', "unique:roles,name,{$role->id}"],
            'permissions' => ['array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ]);

        $role->update(['name' => $data['name']]);
        $role->syncPermissions($data['permissions'] ?? []);
        return redirect()->route('roles.index')->with('success', 'Role updated');
    }

    public function destroy($id)
    {
        $role = Role::findOrFail($id);
        abort_if(in_array($role->name, ['manajer', 'manager']), 403);
        $role->delete();
        return back()->with('success', 'Role deleted');
    }
}
