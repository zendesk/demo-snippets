import React, { useEffect, useState } from 'react';
import { Tag } from '@zendeskgarden/react-tags';
import { Tooltip } from '@zendeskgarden/react-tooltips';
import { Button, IconButton } from '@zendeskgarden/react-buttons';
import { ReactComponent as SpeechBubbleIcon } from '@zendeskgarden/svg-icons/src/12/speech-bubble-plain-stroke.svg';
import { ReactComponent as ThumbsUpIcon } from '@zendeskgarden/svg-icons/src/12/thumbs-up-stroke.svg';
import { ReactComponent as UserGroupIcon } from '@zendeskgarden/svg-icons/src/12/user-group-stroke.svg';
import { ReactComponent as TrashIcon } from '@zendeskgarden/svg-icons/src/16/trash-stroke.svg';
import { ReactComponent as PlusCircleIcon } from '@zendeskgarden/svg-icons/src/16/plus-circle-stroke.svg';
import { Row, Col } from '@zendeskgarden/react-grid';
import { Accordion } from '@zendeskgarden/react-accordions';
import { Modal, Header, Body, Footer, FooterItem, Close } from '@zendeskgarden/react-modals';
import { Field, Label, Input } from '@zendeskgarden/react-forms';

const RoadmapArea = (props) => {
  const [modalState, setModalState] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPostId, setNewItemPostId] = useState("");
  const [newItemImgUrl, setNewItemImgUrl] = useState("https://");
  const [productAreaData, setProductAreaData] = useState({});

  useEffect(() => {
    const endpointUrl = props.backendBaseUrl + '/products/' + props.productKey + '/areas/' + props.productAreaKey;
    fetch(endpointUrl).then(response => {
      if (response.ok) {
        response.json().then(data => {
          setProductAreaData(data.product_area);
        });
      }
    })
  }, [props.backendBaseUrl, props.productKey, props.productAreaKey]);
  const submitAddItem = () => {
    const endpointUrl = props.backendBaseUrl + '/products/' + props.productKey + '/areas/' + props.productAreaKey + '/items';
    tokenHelper.fetch(endpointUrl, {
      method: "POST",
      body: JSON.stringify({
        "name": newItemName,
        "post_id": newItemPostId,
        "img_url": newItemImgUrl
      })
    }).then(props.refreshIfResponseOk);
  }
  const submitDeleteProductArea = () => {
    const endpointUrl = props.backendBaseUrl + '/products/' + props.productKey + '/areas/' + props.productAreaKey;
    tokenHelper.fetch(endpointUrl, {
      method: "DELETE"
    }).then(props.refreshIfResponseOk);
  }
  const submitDeleteItem = (postId) => {
    const endpointUrl = props.backendBaseUrl + '/products/' + props.productKey + '/areas/' + props.productAreaKey + '/items/' + postId;
    tokenHelper.fetch(endpointUrl, {
      method: "DELETE"
    }).then(props.refreshIfResponseOk);
  }
  const tokenHelper = props.tokenHelper;
  const items = productAreaData?.items || []
  return (
    <div className="RoadmapArea">
      {modalState === "add_item" ? <Modal onClose={() => setModalState("")}>
        <Header tag="h2">Add item</Header>
        <Body>
          <Field>
            <Label>Name</Label>
            <Input value={newItemName} onChange={e => setNewItemName(e.target.value)} />
          </Field>

          <Field>
            <Label>Post ID</Label>
            <Input value={newItemPostId} onChange={e => setNewItemPostId(e.target.value)} />
          </Field>

          <Field>
            <Label>Image URL</Label>
            <Input value={newItemImgUrl} onChange={e => setNewItemImgUrl(e.target.value)} />
          </Field>
        </Body>
        <Footer>
          <FooterItem>
            <Button onClick={() => setModalState("")} isBasic>
              Cancel
            </Button>
          </FooterItem>
          <FooterItem>
            <Button isPrimary onClick={submitAddItem}>
              Add item
            </Button>
          </FooterItem>
        </Footer>
        <Close aria-label="Close modal" />
      </Modal> : null}
      {modalState === "delete_product_area" ? <Modal onClose={() => setModalState("")}>
        <Header tag="h2">Delete product area</Header>
        <Body>
          Deleting the product area means that the items under this area goes away.
        </Body>
        <Footer>
          <FooterItem>
            <Button onClick={() => setModalState("")} isBasic>
              Cancel
            </Button>
          </FooterItem>
          <FooterItem>
            <Button isDanger isPrimary onClick={submitDeleteProductArea}>
              Delete product area
            </Button>
          </FooterItem>
        </Footer>
        <Close aria-label="Close modal" />
      </Modal> : null}
      <Accordion level={4} isExpandable defaultExpandedSections={[1]}>
        <Accordion.Section>
          <Accordion.Header>
            <Accordion.Label>{props.productAreaName}</Accordion.Label>
          </Accordion.Header>
          <Accordion.Panel>
            {tokenHelper.isAdmin() && props.editMode
              ? <div>
                <Tooltip content="Delete product area">
                  <IconButton className="SettingsButton" isDanger>
                    <TrashIcon isDanger onClick={() => setModalState("delete_product_area")} />
                  </IconButton>
                </Tooltip>
                <Tooltip content="Add item">
                  <IconButton className="SettingsButton">
                    <PlusCircleIcon onClick={() => setModalState("add_item")} />
                  </IconButton>
                </Tooltip>
              </div>
              : null}
            <div className="RoadmapAreaItems">
              {items.map(function (d, idx) {
                return <div key={"item" + idx} className="RoadmapAreaItem">
                  <img className="RoadmapAreaItemBanner" src={d.img_url} alt={d.name} />
                  {tokenHelper.isAdmin() && props.editMode
                    ? <Tooltip content="Delete item"><IconButton className="SettingsButton" isDanger onClick={() => submitDeleteItem(d.post_id)}><TrashIcon /></IconButton></Tooltip>
                    : null}
                  <h4 className="RoadmapAreaItemName"><a href={d.post_html_url}>{d.name}</a></h4>
                  <h5 className="RoadmapAreaItemPostTitle"><a href={d.post_html_url}>{d.post_title}</a></h5>
                  <Row>
                    <Col size={3}><Tag><span className="RoadmapAreaItemPostFollowerCount"><UserGroupIcon /> {d.post_follower_count}</span></Tag></Col>
                    <Col size={3}><Tag><span className="RoadmapAreaItemPostVoteSum"><ThumbsUpIcon /> {d.post_vote_sum}</span></Tag></Col>
                    <Col size={3}><Tag><span className="RoadmapAreaItemPostCommentCount"><SpeechBubbleIcon /> {d.post_comment_count}</span></Tag></Col>
                    <Col size={3}><Tag><span className="RoadmapAreaItemPostStatus">{d.post_status}</span></Tag></Col>
                  </Row>
                  <div className="RoadmapItemFooter"></div>
                </div>;
              })}
            </div>
          </Accordion.Panel>
        </Accordion.Section>
      </Accordion>
      <div className="RoadmapAreaFooter"></div>
    </div>
  );
}

export default RoadmapArea;
