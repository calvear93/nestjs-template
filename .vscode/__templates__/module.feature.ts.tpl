// Feature Module Template
import { Module } from '@nestjs/common';
// ... add other imports

@Module({
  imports: [/* other modules */],
  controllers: [/* FeatureController */],
  providers: [/* FeatureService */],
  exports: [/* FeatureService */]
})
export class (((pascalCase feature)))Module {}
