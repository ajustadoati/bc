import { Component } from '@angular/core';
import { CatalogKind } from '../../shared/management.models';
import { CatalogListBase, CATALOG_LIST_IMPORTS } from '../catalog-list.page';

@Component({ selector: 'app-workshop-modal', templateUrl: '../catalog-list.page.html', styleUrls: ['../../shared/management.scss'], standalone: true, imports: CATALOG_LIST_IMPORTS })
export class WorkshopModalPage extends CatalogListBase {
  override kind: CatalogKind = 'workshops';
}
