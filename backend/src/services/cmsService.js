import { v4 as uuidv4 } from 'uuid';

// In-memory CMS store backed by persistent schema structure
const cmsStore = {
  pages: {
    'inicio': {
      id: 'page_inicio',
      slug: 'inicio',
      title: 'Caribbe Legal Services | Trámites Consulares, Notaría y Envíos a Cuba en Glendale, AZ',
      metaDescription: 'Agencia notarial especializada en Pasaportes Cubanos, Cartas Poder, Envíos Aéreos y Marítimos a Cuba en Glendale y Phoenix, AZ.',
      keywords: 'pasaporte cubano, notaria glendale az, envios a cuba, cartas poder',
      sections: [
        {
          id: 'hero_section',
          type: 'HERO',
          title: 'Tramitación Notarial y Consular',
          subtitle: 'Agilidad, Confianza y Calidad con Notarias Licenciadas en Arizona',
          heroImage: '../images/brand_banner_hero.jpg',
          ctaText: 'Solicitar Pasaporte',
          ctaUrl: '../paso_1_tipo_de_tr_mite/code.html'
        },
        {
          id: 'services_grid',
          type: 'SERVICES',
          title: 'Nuestros Servicios Destacados',
          blocks: [
            { id: 'b1', title: 'Renovación de Pasaporte Cubano', price: '$280', timeframe: '2 meses' },
            { id: 'b2', title: 'Cartas Poder y Notarización', price: '$50', timeframe: 'Mismo día' },
            { id: 'b3', title: 'Envíos Aéreos Express a Cuba', price: '$6.50/lb', timeframe: '4 a 7 días' }
          ]
        }
      ],
      version: 1,
      updatedAt: new Date().toISOString()
    }
  },
  versions: []
};

export async function getPageContent(slug) {
  const page = cmsStore.pages[slug];
  if (!page) {
    throw new Error(`Página '${slug}' no encontrada en el CMS.`);
  }
  return page;
}

export async function updatePageContent(slug, payload, userId) {
  const existing = cmsStore.pages[slug] || { slug, version: 0 };
  
  // Save previous version in version history
  cmsStore.versions.unshift({
    id: uuidv4(),
    pageSlug: slug,
    version: existing.version,
    data: JSON.parse(JSON.stringify(existing)),
    updatedBy: userId,
    createdAt: new Date().toISOString()
  });

  const updatedPage = {
    ...existing,
    ...payload,
    version: (existing.version || 0) + 1,
    updatedAt: new Date().toISOString(),
    updatedBy: userId
  };

  cmsStore.pages[slug] = updatedPage;
  return updatedPage;
}

export async function createPageSection(slug, sectionPayload) {
  const page = await getPageContent(slug);
  const newSection = {
    id: 'sec_' + uuidv4().substring(0, 8),
    ...sectionPayload
  };
  page.sections.push(newSection);
  return newSection;
}

export async function getPageVersions(slug) {
  return cmsStore.versions.filter(v => v.pageSlug === slug);
}
