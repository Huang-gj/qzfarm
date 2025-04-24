import { getActivity } from './activity';
//生成一个模拟的活动列表，用于前端展示活动数据
export function getActivityList(baseID = 0, length = 10) {
  return new Array(length).fill(0).map((_, idx) => getActivity(idx + baseID));
}

export const activityList = getActivityList();
