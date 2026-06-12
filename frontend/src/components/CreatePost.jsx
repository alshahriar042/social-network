import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createPost } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function CreatePost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const fileRef = useRef();
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [visibility, setVisibility] = useState('public');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImage(null);
    setPreview(null);
    fileRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!body.trim() && !image) {
      setError('Please write something or attach an image.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const fd = new FormData();
      if (body.trim()) fd.append('body', body.trim());
      if (image) fd.append('image', image);
      fd.append('visibility', visibility);
      const res = await createPost(fd);
      setBody('');
      setImage(null);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';

      // Prepend the new post using the response we already have, which
      // carries `image_status: 'pending'`. A resetQueries() refetch can
      // race with queue:listen and come back with the image already
      // processed, losing the "pending" state the PostCard needs to
      // show the processing overlay.
      queryClient.setQueryData(['posts'], (old) => {
        if (!old) return old;
        const [firstPage, ...rest] = old.pages;
        return {
          ...old,
          pages: [{ ...firstPage, data: [res.data, ...firstPage.data] }, ...rest],
        };
      });

      if (res.data?.image_status === 'pending') {
        addToast('Post published! Your image is still processing...');
      } else {
        addToast('Post published!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to post. Try again.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`;

  return (
    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
      <form onSubmit={handleSubmit}>
        <div className="_feed_inner_text_area_box" style={{ marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#377DFF', flexShrink: 0, marginRight: 10 }}>
            {initials}
          </div>
          <div className="form-floating _feed_inner_text_area_box_form" style={{ flex: 1 }}>
            <textarea
              className="form-control _textarea"
              placeholder="Write something..."
              id="postTextarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{ minHeight: 80, resize: 'none' }}
            />
            <label className="_feed_textarea_label" htmlFor="postTextarea">Write something...</label>
          </div>
        </div>

        {preview && (
          <div style={{ position: 'relative', marginBottom: 12, display: 'inline-block' }}>
            <img src={preview} alt="preview" style={{ maxHeight: 180, borderRadius: 8, objectFit: 'cover' }} />
            <button type="button" onClick={clearImage} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>×</button>
          </div>
        )}

        {error && <p style={{ color: '#e74c3c', fontSize: 13, marginBottom: 8 }}>{error}</p>}

        <div className="_feed_inner_text_area_bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              className="_feed_inner_text_area_bottom_photo_link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path fill="#666" d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917zm0 1.504H5.999c-2.321 0-3.799 1.735-3.799 4.41v8.17c0 2.68 1.472 4.412 3.799 4.412h7.917c2.328 0 3.807-1.734 3.807-4.411v-8.17c0-2.678-1.478-4.411-3.807-4.411zM6.831 4.64c1.265 0 2.292 1.125 2.292 2.51 0 1.386-1.027 2.511-2.292 2.511S4.54 8.537 4.54 7.152c0-1.386 1.026-2.51 2.291-2.51zm0 1.504c-.507 0-.918.451-.918 1.007 0 .555.411 1.006.918 1.006.507 0 .919-.451.919-1.006 0-.556-.412-1.007-.919-1.007z"/>
              </svg>
              {' '}Photo
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />

            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, color: '#555', cursor: 'pointer' }}
            >
              <option value="public">🌐 Public</option>
              <option value="private">🔒 Private</option>
            </select>
          </div>

          <div className="_feed_inner_text_area_btn">
            <button type="submit" className="_feed_inner_text_area_btn_link" disabled={submitting}>
              <svg className="_mar_img" xmlns="http://www.w3.org/2000/svg" width="14" height="13" fill="none" viewBox="0 0 14 13">
                <path fill="#fff" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z" clipRule="evenodd" />
              </svg>
              {' '}{submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
