import { useRef } from 'react';
import { ConversationWrapper, StatusError } from './Conversation.styled';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import ReactResizeDetector from 'react-resize-detector';
import { useConversation } from './useConversation.hook';
import { AddTopic } from './addTopic/AddTopic';
import { TopicItem } from './topicItem/TopicItem';
import { LazyConversation } from './LazyConversation';
import { Spin, Tooltip } from 'antd';
import { ChannelHeader } from './channelHeader/ChannelHeader';

export function Conversation({ closeConversation, openDetails, cardId, channelId }) {

  const { state, actions } = useConversation(cardId, channelId);
  const thread = useRef(null);

  const topicRenderer = (topic, index) => {
    return (<TopicItem key={topic.id || index} host={cardId == null} contentKey={state.contentKey} topic={topic}
      remove={() => actions.removeTopic(topic.id)}
      update={(text) => actions.updateTopic(topic, text)}
      sealed={state.sealed && !state.contentKey}
      strings={state.strings}
      colors={state.colors}
      menuStyle={state.menuStyle}
    />)
  }

  const scrollThread = (e) => {
  };

  const latch = () => {
  }

  return (
    <ConversationWrapper>
      <ChannelHeader openDetails={openDetails} closeConversation={closeConversation} contentKey={state.contentKey}/>
      <div className="thread" ref={thread}>
        { state.topics.length !== 0 && (
          <ReactResizeDetector handleHeight={true}>
            {() => {
              return (
                <LazyConversation
                  topics={state.topics}
                  topicRenderer={topicRenderer}
                  onLoadMore={actions.more}
                  hasMore={!state.atEnd}
                  loadingMore={state.loadingMore}
                  loadingInit={state.loadingInit}
                  contentKey={state.contentKey}
                />
              );
            }}
          </ReactResizeDetector>
        )}
        { state.loadingInit && state.topics.length === 0 && (
          <div className="loading">
            <Spin size="large" delay={250} />
          </div>
        )}
        { !state.loadingInit && state.topics.length === 0 && (
          <div className="empty">This Topic Has No Messages</div>
        )}
      </div>
      <div className="divider">
        <div className="line" />
        { state.uploadError && (
          <div className="progress-error" />
        )}
        { state.upload && !state.uploadError && (
          <div className="progress-active" style={{ width: state.uploadPercent + '%' }} />
        )}
        { !state.upload && (
          <div className="progress-idle" />
        )}
      </div>
      <div className="topic"> 
        { (!state.sealed || state.contentKey) && (
          <AddTopic contentKey={state.contentKey} strings={state.strings} menuStyle={state.menuStyle} />
        )}
        { state.uploadError && (
          <div className="upload-error">
            { state.display === 'small' && (
              <StatusError>
                <div onClick={() => actions.clearUploadErrors(cardId, channelId)}>
                  <ExclamationCircleOutlined />
                </div>
              </StatusError>
            )}
            { state.display !== 'small' && (
              <Tooltip placement="bottom" title="upload error">
                <StatusError>
                  <div onClick={() => actions.clearUploadErrors(cardId, channelId)}>
                    <ExclamationCircleOutlined />
                  </div>
                </StatusError>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </ConversationWrapper>
  );
}
