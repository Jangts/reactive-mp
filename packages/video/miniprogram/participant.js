/** 共享参与者标记，使视频与媒体组合组件可以加入同一个控制范围。 */
let participant;
export function getVideoParticipantBehavior() {
  if (!participant) {
    participant = Behavior({
      methods: {
        mute() {
          this.setData({ soundOff: true });
        },
      },
    });
  }
  return participant;
}
