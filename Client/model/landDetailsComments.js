import { landDetailsCommentsList } from './landDetailsCommentsList';

function getLandDetailsCommentsCount(land_id) {
  return landDetailsCommentsList.length;
}

function getLandDetailsComments(land_id) {
  return landDetailsCommentsList;
}

module.exports = {
  getLandDetailsCommentsCount,
  getLandDetailsComments,
}; 