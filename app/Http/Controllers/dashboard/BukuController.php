<?php

namespace App\Http\Controllers\dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Book;

class BukuController extends Controller
{
    public function index(Request $request)
    {
        $books = Book::with([
            'manuscript.author', 
            'pic', 
            'publisher',
            'taskProgress.masterTask'
        ])->get();
        
            return Inertia::render('dashboard', [
            'books' => $books
        ]);
    }
    
    public function show($id)
    {
        $book = Book::with([
            'manuscript.author', 
            'pic', 
            'publisher',
            'taskProgress.masterTask'
        ])->find($id);
        
        return Inertia::render('dashboard/book/show', [
            'book' => $book
        ]);
    }
    
    public function edit($id)
    {
        $book = Book::with([
            'manuscript.author', 
            'pic', 
            'publisher',
            'taskProgress.masterTask'
        ])->find($id);
        
        return Inertia::render('dashboard/book/edit', [
            'book' => $book
        ]);
    }
    
    public function update(Request $request, $id)   
    {
        $book = Book::find($id);
        $book->update($request->all());
        return redirect()->route('dashboard.buku.index');
    }
    
    public function destroy($id)
    {
        $book = Book::find($id);
        $book->delete();
        return redirect()->route('dashboard.book.index');
    }
}