export type FeedType = 'top' | 'community' | 'user';

export interface FilterOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export const NormalFeedTypeOptions = [
	{
		value: 'Posts',
		label: 'Posts'
	},
	{
		value: 'Comments',
		label: 'Comments'
	}
];
export const UserFeedTypeOptions = [
	{
		value: 'Overview',
		label: 'Overview'
	},
	{
		value: 'Comments',
		label: 'Comments'
	},
	{
		value: 'Posts',
		label: 'Posts'
	},
	{
		value: 'Saved',
		label: 'Saved'
	}
];

export const ListingOptions = (loggedIn: boolean) => [
	{
		value: 'Subscribed',
		label: 'Subscribed',
		disabled: !loggedIn
	},
	{
		value: 'Local',
		label: 'Local'
	},
	{
		value: 'All',
		label: 'All'
	}
];

export const PostSortOptions = [
	{
		value: 'Hot',
		label: 'Hot'
	},
	{
		value: 'Active',
		label: 'Active'
	},
	{
		value: 'New',
		label: 'New'
	},
	{
		value: 'Old',
		label: 'Old'
	},
	{
		value: 'MostComments',
		label: 'Most Comments'
	},
	{
		value: 'NewComments',
		label: 'New Comments'
	},
	{
		value: 'TopDay',
		label: 'Top Day'
	},
	{
		value: 'TopWeek',
		label: 'Top Week'
	},
	{
		value: 'TopMonth',
		label: 'Top Month'
	},
	{
		value: 'TopYear',
		label: 'Top Year'
	},
	{
		value: 'TopAll',
		label: 'Top All Time'
	}
];

export const CommentSortOptions = [
	{
		value: 'Hot',
		label: 'Hot'
	},
	{
		value: 'Active',
		label: 'Active'
	},
	{
		value: 'New',
		label: 'New'
	},
	{
		value: 'Old',
		label: 'Old'
	}
];

export const UserSortOptions = [
	{
		value: 'New',
		label: 'New'
	},
	{
		value: 'Old',
		label: 'Old'
	},
	{
		value: 'TopDay',
		label: 'Top Day'
	},
	{
		value: 'TopWeek',
		label: 'Top Week'
	},
	{
		value: 'TopMonth',
		label: 'Top Month'
	},
	{
		value: 'TopYear',
		label: 'Top Year'
	},
	{
		value: 'TopAll',
		label: 'Top All Time'
	}
];
