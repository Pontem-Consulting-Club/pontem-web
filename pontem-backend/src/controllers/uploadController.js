const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.uploadFile = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
  }

  const fileName = `${Date.now()}-${file.originalname}`;

  try {
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    const fileType = file.mimetype;

    if (error) {
      throw error;
    }

    console.log('Tamaño del archivo recibido:', file.size);
    console.log('Archivo subido exitosamente a Supabase:', fileName);
    res.json({ filePath: fileName });
  } catch (err) {
    console.error('Error al procesar la carga:', err);
    res.status(500).json({ error: 'Error al procesar la carga' });
  }
};
