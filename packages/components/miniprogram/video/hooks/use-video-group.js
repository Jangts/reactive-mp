/** 以共享 Behavior 标记连接普通组件和响应式组件，协调范围由原生关系确定。 */
import { useSignal } from '@reactive-mp/reactivity';
import {
  behaviors,
  relation,
  useCurrentInstance,
  onUnmounted,
} from '@reactive-mp/runtime';
import { getVideoParticipantBehavior } from '../utils/participant.js';

export function useVideoParticipant(mute) {
  const instance = useCurrentInstance();
  let group;
  behaviors(getVideoParticipantBehavior());
  relation('video-group', {
    type: 'ancestor',
    target: getVideoParticipantBehavior(),
    linked(target) {
      group = target;
      if (instance) {
        instance._videoGroup = target;
      }
    },
    unlinked(target) {
      if (group === target) {
        group = undefined;
      }
      if (instance?._videoGroup === target) {
        instance._videoGroup = undefined;
      }
    },
  });
  onUnmounted(() => {
    group = undefined;
    if (instance) {
      instance._videoGroup = undefined;
    }
  });
  return { mute, activateSound: () => group?.muteAll(instance) };
}

export function useVideoGroup() {
  const instance = useCurrentInstance();
  const members = new Set();
  const [memberCount, setMemberCount] = useSignal(0);
  behaviors(getVideoParticipantBehavior());
  relation('participant', {
    type: 'descendant',
    target: getVideoParticipantBehavior(),
    linked(target) {
      members.add(target);
      target._videoGroup = instance;
      setMemberCount(members.size);
    },
    unlinked(target) {
      members.delete(target);
      if (target._videoGroup === instance) {
        target._videoGroup = undefined;
      }
      setMemberCount(members.size);
    },
  });
  onUnmounted(() => {
    for (const member of members) {
      if (member._videoGroup === instance) {
        member._videoGroup = undefined;
      }
    }
    members.clear();
  });
  return {
    memberCount,
    muteAll(except) {
      for (const member of members) {
        if (member !== except) {
          member.mute();
        }
      }
    },
  };
}
