import { Post } from '../../../mongo-db/models';
import authenticated from '../../middleware/authenticated';
import uploaders from '../aws/uploaders';

const { fileUpload } = uploaders;

const postMutations = {
  post: authenticated(async (_, { post }, { req: { userRequesting } }) => {
    const postToCreate = { ...post };
    let attachments = [];
    let gallery = [];

    if (postToCreate.attachments) attachments = [...postToCreate.attachments];
    if (postToCreate.gallery) gallery = [...postToCreate.gallery];

    delete postToCreate.attachments;
    delete postToCreate.gallery;

    const newPost = new Post({ author: userRequesting.id, ...postToCreate });

    const attachmentsUpload = attachments.map(file =>
      fileUpload(_, { file, folderKey: 'posts', id: newPost.id })
    );
    newPost.attachments = await Promise.all(attachmentsUpload);

    const galleryUpload = gallery.map(file =>
      fileUpload(_, { file, folderKey: 'posts', id: newPost.id })
    );
    newPost.gallery = await Promise.all(galleryUpload);

    await newPost.save();

    return Post.findOne({ _id: newPost.id }).populate('author');
  }),
  postDelete: authenticated(async (_, { id }, { req: { userRequesting } }) => {
    try {
      await Post.deleteById(id, userRequesting.id);
      return true;
    } catch (e) {
      return e;
    }
  })
};

export default postMutations;
