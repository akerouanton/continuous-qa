import GenerateBuildId from './GenerateBuildId';
import PublishBuildCreated from './PublishBuildCreated';
import PublishTaskQueued from './PublishTaskQueued';
import PublishTaskFinished from './PublishTaskFinished';

const listeners = {
  GenerateBuildId,
  PublishBuildCreated,
  PublishTaskQueued,
  PublishTaskFinished
};
export default listeners;
