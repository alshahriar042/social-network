<?php

namespace App\Http\Requests\Post;

use Illuminate\Foundation\Http\FormRequest;

class CreatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'body'       => 'nullable|string|max:10000',
            'image'      => 'nullable|image|mimes:jpg,jpeg,png,gif,webp',
            'visibility' => 'required|in:public,private',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            if (empty($this->body) && !$this->hasFile('image')) {
                $v->errors()->add('body', 'A post must have text or an image.');
            }
        });
    }
}
