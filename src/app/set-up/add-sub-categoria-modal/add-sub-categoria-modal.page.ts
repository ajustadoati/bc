import { Component } from '@angular/core';
import { CatalogKind } from '../../shared/management.models';
import { CatalogFormBase, CATALOG_FORM_IMPORTS } from '../catalog-form.page';

@Component({ selector: 'app-add-sub-categoria-modal', templateUrl: '../catalog-form.page.html', styleUrls: ['../../shared/management.scss'], standalone: true, imports: CATALOG_FORM_IMPORTS })
export class AddSubCategoriaModalPage extends CatalogFormBase {
  override kind: CatalogKind = 'types';
}
