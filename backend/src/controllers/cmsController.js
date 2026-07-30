import * as cmsService from '../services/cmsService.js';

export async function getPage(req, res) {
  try {
    const slug = req.params.slug || 'inicio';
    const content = await cmsService.getPageContent(slug);
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
}

export async function updatePage(req, res) {
  try {
    const slug = req.params.slug || 'inicio';
    const updated = await cmsService.updatePageContent(slug, req.body, req.user ? req.user.id : 'ADMIN');
    res.json({ success: true, message: 'Página actualizada con éxito en el CMS.', data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

export async function addSection(req, res) {
  try {
    const slug = req.params.slug || 'inicio';
    const section = await cmsService.createPageSection(slug, req.body);
    res.status(201).json({ success: true, message: 'Nueva sección creada.', data: section });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

export async function getVersions(req, res) {
  try {
    const slug = req.params.slug || 'inicio';
    const versions = await cmsService.getPageVersions(slug);
    res.json({ success: true, data: versions });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}
