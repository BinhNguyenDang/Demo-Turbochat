class AddFieldsToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :firstname, :string
    add_column :users, :lastname, :string
    add_column :users, :birthday, :date
  end
end
