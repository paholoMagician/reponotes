import { NgModule } from "@angular/core";
import { LoginComponent } from "../../shared/login/login.component";
import { DashboardComponent } from "../dashboard/dashboard.component";
import { NavsideComponent } from "../../shared/navside/navside.component";

/**
 * ANGULAR MATERIAL
 */
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';

import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
// import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from "@angular/material/form-field";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { InputPromptComponent } from "../input-prompt/input-prompt.component";

/** GOOGLE MODULES */
import { SocialLoginModule, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { WindowFunctionComponent } from "../dashboard/window-function/window-function.component";
import { NotasComponent } from "../dashboard/notas/notas.component";
import { QuillModule } from "ngx-quill";
import { UploadFileComponent } from "../dashboard/upload-file/upload-file.component";
import { FolderOpenComponent } from "../dashboard/folder-open/folder-open.component";

@NgModule({
  declarations: [
    LoginComponent,
    DashboardComponent,
    NavsideComponent,
    InputPromptComponent,
    WindowFunctionComponent,
    NotasComponent,
    UploadFileComponent,
    FolderOpenComponent
  ], imports: [
    SocialLoginModule,
    DragDropModule,
    // #angularMaterial
    MatFormFieldModule,
    CommonModule,
    MatTabsModule,
    MatSidenavModule,
    MatSliderModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    QuillModule.forRoot(),
  ], exports: [
    LoginComponent,
    NavsideComponent,
    WindowFunctionComponent,
    NotasComponent,
    UploadFileComponent,
    FolderOpenComponent
  ], providers: [
    provideHttpClient(withFetch(),),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider('1093422262729-afqc0lejvrg3eesmj60le80bh8lk73gh.apps.googleusercontent.com')
          }
        ],
      } as SocialAuthServiceConfig,
    }
  ]
})

export class componentModule { }
