import { translations } from '../utils/translations.js';

// Helper function to get translations
const t = (key) => {
  // This is a simplified version - in practice, you'd use the actual translation hook
  return translations.en[key] || key;
};

export const categories = [
  {
    id: 'img1',
    title: t('birthday'),
    description: t('birthdayDescription'),
    coverImage: '/images/img-cover-1.jpg',
    templateCount: 4
  },
  {
    id: 'img2',
    title: t('anniversary'),
    description: t('anniversaryDescription'),
    coverImage: '/images/img-cover-2.jpg',
    templateCount: 4
  },
  {
    id: 'img3',
    title: t('congratulations'),
    description: t('congratulationsDescription'),
    coverImage: '/images/img-cover-3.jpg',
    templateCount: 4
  },
  {
    id: 'img4',
    title: t('thankYou'),
    description: t('thankYouDescription'),
    coverImage: '/images/img-cover-4.jpg',
    templateCount: 4
  },
  {
    id: 'img5',
    title: t('sympathy'),
    description: t('sympathyDescription'),
    coverImage: '/images/img-cover-5.jpg',
    templateCount: 4
  },
  {
    id: 'img6',
    title: t('wedding'),
    description: t('weddingDescription'),
    coverImage: '/images/img-cover-6.jpg',
    templateCount: 4
  },
  {
    id: 'img7',
    title: t('graduation'),
    description: t('graduationDescription'),
    coverImage: '/images/img-cover-7.jpg',
    templateCount: 4
  },
  {
    id: 'img8',
    title: t('holiday'),
    description: t('holidayDescription'),
    coverImage: '/images/img-cover-8.jpg',
    templateCount: 4
  }
];

// Category to template mapping
export const imageCards = {
  img1: ["temp1", "temp2", "temp3", "temp4"],
  img2: ["temp5", "temp6", "temp7", "temp8"],
  img3: ["temp9", "temp10", "temp11", "temp12"],
  img4: ["temp13", "temp14", "temp15", "temp16"],
  img5: ["temp17", "temp18", "temp19", "temp20"],
  img6: ["temp1", "temp2", "temp3", "temp4"], // Reusing templates for new categories
  img7: ["temp5", "temp6", "temp7", "temp8"],
  img8: ["temp9", "temp10", "temp11", "temp12"]
};

// Card titles with translations (keeping for backward compatibility)
export const cardTitles = {
  'img1': t('birthday'),
  'img2': t('anniversary'),
  'img3': t('congratulations'),
  'img4': t('thankYou'),
  'img5': t('sympathy'),
  'img6': t('wedding'),
  'img7': t('graduation'),
  'img8': t('holiday')
}; 