import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContentComponent } from  "./components/content/content.component";

const routes: Routes = [
  {
    path: '', component: ContentComponent, data: {title: "About"}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AboutRoutingModule { }