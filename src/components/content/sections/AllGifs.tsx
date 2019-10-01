import { inject } from 'mobx-react';
import React, { Component } from 'react';

import { GifOrder } from '../../../common/constants';
import { IStoreComponentProps } from '../../App';
import GifList from '../componentes/GifList';

@inject('store')
export default class extends Component<IStoreComponentProps> {
  public componentDidMount() {
    this.props.store!.gifs.setSearchCriteria({ user: undefined, sort: GifOrder.creation });
  }

  public render() {
    return <GifList />;
  }
}