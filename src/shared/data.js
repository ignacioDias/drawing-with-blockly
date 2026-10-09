import {getCollections, getLevel} from './api';
import {
  getLocalLevel,
  isLocalId,
  readLocalCollections,
  readLocalLevels,
} from './local-store';

export const loadCollections = async () => {
  const remote = await getCollections();
  const localCollections = readLocalCollections();
  const localLevels = readLocalLevels();

  const collections = remote.collections.map((collection) => ({
    ...collection,
    is_temporary: false,
    levels: (collection.levels || []).map((level) => ({...level, is_temporary: false})),
  }));

  for (const local of localCollections) {
    const levels = localLevels
      .filter((level) => String(level.collection_id) === String(local.id))
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((level) => ({...level, is_temporary: true}));
    collections.push({...local, is_temporary: true, levels});
  }

  return {collections, completed_level_ids: remote.completed_level_ids};
};

export const loadLevel = async (id) => {
  if (isLocalId(id)) {
    const level = getLocalLevel(id);
    if (!level) throw new Error('Level not found');
    return {...level, is_temporary: true};
  }
  return getLevel(id);
};
