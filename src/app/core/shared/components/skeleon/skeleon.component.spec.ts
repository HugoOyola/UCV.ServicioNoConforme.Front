import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SkeletonComponent} from './skeleton.component';

describe('SkeleonComponent', () => {
	let component: SkeletonComponent;
	let fixture: ComponentFixture<SkeletonComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SkeletonComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(SkeletonComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
