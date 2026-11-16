/** 惰性创建原生关系标记，使普通组件和响应式组件共享分组协议。 */
let participant, group;
export function getVideoParticipantBehavior() {
  if (!participant) {
    participant = Behavior({});
  }
  return participant;
}
export function getVideoGroupBehavior() {
  if (!group) {
    group = Behavior({});
  }
  return group;
}
