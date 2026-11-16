/** 以组件树限定声音互斥范围，卸载时释放成员引用。 */
import { getVideoParticipantBehavior } from '../participant.js';
Component({
  relations: {
    participant: {
      type: 'descendant',
      target: getVideoParticipantBehavior(),
      linked(target) {
        this._members.add(target);
        target._videoGroup = this;
      },
      unlinked(target) {
        this._members.delete(target);
        if (target._videoGroup === this) {
          target._videoGroup = undefined;
        }
      },
    },
  },
  lifetimes: {
    created() {
      this._members = new Set();
    },
    detached() {
      for (const member of this._members) {
        if (member._videoGroup === this) {
          member._videoGroup = undefined;
        }
      }
      this._members.clear();
    },
  },
  methods: {
    muteAll(except) {
      for (const member of this._members) {
        if (member !== except) {
          member.mute();
        }
      }
    },
  },
});
