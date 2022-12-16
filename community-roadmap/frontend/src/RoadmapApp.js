import React, { useEffect, useState } from 'react';
import './RoadmapApp.css';
import RoadmapArea from './RoadmapArea';
import IntegrationTokenHelper from './IntegrationTokenHelper';
import { Tooltip } from '@zendeskgarden/react-tooltips';
import { ThemeProvider } from '@zendeskgarden/react-theming';
import { Notification, Title, Close as NotificationClose } from '@zendeskgarden/react-notifications';
import { Dropdown, Multiselect, Menu, Item, Field as DropdownField, Label as DropdownLabel } from '@zendeskgarden/react-dropdowns';
import { Tag } from '@zendeskgarden/react-tags';
import { Button, IconButton } from '@zendeskgarden/react-buttons';
import { ReactComponent as AdjustStrokeIcon } from '@zendeskgarden/svg-icons/src/12/adjust-stroke.svg';
import { ReactComponent as AdjustFilledIcon } from '@zendeskgarden/svg-icons/src/12/adjust-fill.svg';
import { ReactComponent as TrashIcon } from '@zendeskgarden/svg-icons/src/16/trash-stroke.svg';
import { ReactComponent as PlusCircleIcon } from '@zendeskgarden/svg-icons/src/16/plus-circle-stroke.svg';
import { ReactComponent as UserGroupIcon } from '@zendeskgarden/svg-icons/src/16/user-group-stroke.svg';
import { Modal, Header, Body, Footer, FooterItem, Close } from '@zendeskgarden/react-modals';
import { Field, Label, Input } from '@zendeskgarden/react-forms';

function generateKey(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const RoadmapApp = (props) => {
  const tokenHelper = new IntegrationTokenHelper(props.tokenEndpointUrl);
  const [editMode, setEditMode] = useState(false);
  const [productData, setProductData] = useState({});
  const [modalState, setModalState] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [newProductName, setNewProductName] = useState("My product");
  const [newProductAreaKey, setNewProductAreaKey] = useState(generateKey(6));
  const [newProductAreaName, setNewProductAreaName] = useState("My product area");
  const [owners, setOwners] = useState([]);
  const [ownersInputValue, setOwnersInputValue] = useState('');

  useEffect(() => {
    const endpointUrl = props.backendBaseUrl + '/products/' + props.productKey;
    fetch(endpointUrl).then(response => {
      if (response.ok) {
        response.json().then(data => {
          setProductData(data.product);
          setOwners(data.product.owners);
        });
      } else if (response.status == 404) {
        setModalState("product_not_found");
      }
    })
  }, [props.backendBaseUrl, props.productKey]);

  const refreshIfResponseOk = (response) => {
    if (response.ok) {
      window.location.reload(false);
    } else {
      response.text().then(text => {
        setModalState("error");
        setErrorDetails(text);
      })
    }
  }

  const submitCreateProductModal = () => {
    tokenHelper.fetch(props.backendBaseUrl + '/products', {
      method: "POST",
      body: JSON.stringify({
        "key": props.productKey,
        "name": newProductName
      })
    }).then(refreshIfResponseOk);
  }

  const submitDeleteProductModal = () => {
    tokenHelper.fetch(props.backendBaseUrl + '/products/' + props.productKey, {
      method: "DELETE"
    }).then(refreshIfResponseOk);
  }

  const submitAddProductAreaModal = () => {
    tokenHelper.fetch(props.backendBaseUrl + '/products/' + props.productKey + '/areas', {
      method: "POST",
      body: JSON.stringify({
        "key": newProductAreaKey,
        "name": newProductAreaName
      })
    }).then(refreshIfResponseOk);
  }

  const submitEditOwnersModal = () => {
    tokenHelper.fetch(props.backendBaseUrl + '/products/' + props.productKey + '/owners', {
      method: "PUT",
      body: JSON.stringify({
        "owners": owners
      })
    }).then(refreshIfResponseOk);
  }

  return (
    <ThemeProvider>
      {modalState === "error" ? <Notification type="error">
        <Title>Error</Title>
        {errorDetails}
      </Notification> : null}

      <div className="RoadmapProduct">
        {tokenHelper.isAdmin() && modalState === "product_not_found" ? <Modal onClose={() => setModalState("")}>
          <Header tag="h2">Product not found</Header>
          <Body>
            Product does not exist! Create it?

            <Field>
              <Label>Key</Label>
              <Input value={props.productKey} disabled />
            </Field>

            <Field>
              <Label>Name</Label>
              <Input value={newProductName} onChange={e => setNewProductName(e.target.value)} />
            </Field>
          </Body>
          <Footer>
            <FooterItem>
              <Button onClick={() => setModalState("")} isBasic>
                Cancel
              </Button>
            </FooterItem>
            <FooterItem>
              <Button isPrimary onClick={submitCreateProductModal}>
                Create product
              </Button>
            </FooterItem>
          </Footer>
          <Close aria-label="Close modal" />
        </Modal> : null}
        {modalState === "add_product_area" ? <Modal onClose={() => setModalState("")}>
          <Header tag="h2">Add product area</Header>
          <Body>
            Roadmap items are contained within product areas. A product area can be large or small, and can contain unlimited items.

            <Field>
              <Label>Key</Label>
              <Input value={newProductAreaKey} onChange={e => setNewProductAreaKey(e.target.value)} />
            </Field>

            <Field>
              <Label>Name</Label>
              <Input value={newProductAreaName} onChange={e => setNewProductAreaName(e.target.value)} />
            </Field>
          </Body>
          <Footer>
            <FooterItem>
              <Button onClick={() => setModalState("")} isBasic>
                Cancel
              </Button>
            </FooterItem>
            <FooterItem>
              <Button isPrimary onClick={submitAddProductAreaModal}>
                Add product area
              </Button>
            </FooterItem>
          </Footer>
          <Close aria-label="Close modal" />
        </Modal> : null}
        {modalState === "delete_product" ? <Modal onClose={() => setModalState("")}>
          <Header tag="h2">Delete product</Header>
          <Body>
            Deleting the product means that the complete roadmap goes away.
          </Body>
          <Footer>
            <FooterItem>
              <Button onClick={() => setModalState("")} isBasic>
                Cancel
              </Button>
            </FooterItem>
            <FooterItem>
              <Button isDanger isPrimary onClick={submitDeleteProductModal}>
                Delete product
              </Button>
            </FooterItem>
          </Footer>
          <Close aria-label="Close modal" />
        </Modal> : null}
        {modalState === "edit_owners" ? <Modal onClose={() => setModalState("")}>
          <Header tag="h2">Edit product owners</Header>
          <Body>
            Product owners are the users who can edit the roadmap.

            <Dropdown
              inputValue={ownersInputValue}
              selectedItems={owners}
              onSelect={setOwners}
              downshiftProps={{ defaultHighlightedIndex: 0 }}
              onInputValueChange={setOwnersInputValue}
            >
              <DropdownField>
                <DropdownLabel>Owners</DropdownLabel>
                <Multiselect renderItem={({ value, removeValue }) =>
                (
                  <Tag>
                    <span>User #{value}</span>
                    <Tag.Close onClick={() => removeValue()} />
                  </Tag>
                )}
                />
              </DropdownField>
              <Menu>
                <Item key={ownersInputValue} value={ownersInputValue}>
                  <span>User #{ownersInputValue}</span>
                </Item>
              </Menu>
            </Dropdown>
          </Body>
          <Footer>
            <FooterItem>
              <Button onClick={() => setModalState("")} isBasic>
                Cancel
              </Button>
            </FooterItem>
            <FooterItem>
              <Button isPrimary onClick={submitEditOwnersModal}>
                Save product owners
              </Button>
            </FooterItem>
          </Footer>
          <Close aria-label="Close modal" />
        </Modal> : null}
        {tokenHelper.isAdmin() && modalState === "" ?
          <div>
            <Tooltip content="Edit roadmap">
              <IconButton className="SettingsButton" onClick={() => { setEditMode(!editMode) }}>
                {editMode ? <AdjustFilledIcon /> : <AdjustStrokeIcon />}
              </IconButton>
            </Tooltip>
            {editMode ?
              <Tooltip content="Delete product roadmap">
                <IconButton className="SettingsButton" isDanger onClick={() => { setModalState("delete_product") }}>
                  <TrashIcon />
                </IconButton>
              </Tooltip> : null}
            {editMode ?
              <Tooltip content="Edit product owners">
                <IconButton className="SettingsButton" onClick={() => { setModalState("edit_owners") }}>
                  <UserGroupIcon />
                </IconButton>
              </Tooltip> : null}
            {editMode ?
              <Tooltip content="Add product area">
                <IconButton className="SettingsButton" onClick={() => { setModalState("add_product_area") }}>
                  <PlusCircleIcon />
                </IconButton>
              </Tooltip> : null}
          </div>
          : null}
        <h2 className="RoadmapProductName">{productData?.name}</h2>
        <div className="RoadmapAreas">
          {productData?.product_areas?.map(function (d, idx) {
            return <RoadmapArea key={"area" + idx} backendBaseUrl={props.backendBaseUrl} productKey={props.productKey} productAreaKey={d.key} productAreaName={d.name} tokenHelper={tokenHelper} editMode={editMode} refreshIfResponseOk={refreshIfResponseOk} />;
          })}
        </div>
        <div className="RoadmapProductFooter"></div>
      </div>
    </ThemeProvider>
  );
}

export default RoadmapApp;
