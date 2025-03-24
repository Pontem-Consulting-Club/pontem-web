import React, { useState, useEffect } from 'react';
import '../styles/Admin.css';

function Form({ item, onSave }) {
  const [formData, setFormData] = useState({ title: '', description: '' });

  useEffect(() => {
    if (item) {
      setFormData({ title: item.title, description: item.description });
    } else {
      setFormData({ title: '', description: '' });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" value={formData.title} onChange={handleChange} placeholder="Título" />
      <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descripción" />
      <button type="submit">Guardar</button>
    </form>
  );
}

export default Form; 