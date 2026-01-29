import React, { useState, useEffect } from 'react';
import { Progress, Modal, Spin } from 'antd';
import ReactResizeDetector from 'react-resize-detector';
import { ImageAssetWrapper, ImageModalWrapper } from './ImageAsset.styled';
import { useImageAsset } from './useImageAsset.hook';
import { Colors } from 'constants/Colors';

export function ImageAsset({ asset, contentKey }) {
  const { state, actions } = useImageAsset(asset, contentKey);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  const popout = () => {
    if (dimension.width / dimension.height > window.innerWidth / window.innerHeight) {
      let width = Math.floor(window.innerWidth * 9 / 10);
      let height = Math.floor(width * dimension.height / dimension.width);
      actions.setPopout(width, height);
    }
    else {
      let height = Math.floor(window.innerHeight * 9 / 10);
      let width = Math.floor(height * dimension.width / dimension.height);
      actions.setPopout(width, height);
    }
  }

  return (
    <ImageAssetWrapper>
      <ReactResizeDetector handleWidth={true} handleHeight={true}>
        {({ width, height }) => {
          if (width !== dimension.width || height !== dimension.height) {
            setDimension({ width, height });
          }
          return <img style={{ height: '100%', objectFit: 'contain' }} src={asset.thumb} alt="" />
        }}
      </ReactResizeDetector>
      <div class="viewer">
        <div class="overlay" style={{ width: dimension.width, height: dimension.height }}
            onClick={popout} />
        <Modal centered={true} visible={state.popout} width={state.width + 12} bodyStyle={{ width: '100%', height: 'auto', paddingBottom: 6, paddingTop: 6, paddingLeft: 6, paddingRight: 6, backgroundColor: '#dddddd' }} footer={null} destroyOnClose={true} closable={false} onCancel={actions.clearPopout}>
          <ImageModalWrapper onClick={actions.clearPopout}>
            <div class="frame">
              { (state.progressiveUrl || asset.thumb) && !state.url && (
                <img 
                  class="thumb" 
                  src={state.progressiveUrl || asset.thumb} 
                  alt="topic asset preview"
                  style={{ opacity: state.url ? 0 : 1 }}
                />
              )}
              { !state.error && (
                <div class="loading">
                  <Spin size="large" delay={250} />
                  { state.total !== 0 && (
                    <Progress percent={Math.floor(100 * state.block / state.total)} size="small" showInfo={false} trailColor={Colors.white} strokeColor={Colors.background} />
                  )}
                  { state.progressive && (
                    <div style={{ fontSize: 12, marginTop: 8, color: Colors.background }}>Progressive loading...</div>
                  )}
                </div>
              )}
              { state.error && (
                <div class="failed">
                  <Spin size="large" delay={250} />
                </div>
              )}
              { !state.loading && state.url && (
                <img class="full" src={state.url} alt="topic asset" />
              )}
            </div>
          </ImageModalWrapper>
        </Modal>
      </div>
    </ImageAssetWrapper>
  )
}
