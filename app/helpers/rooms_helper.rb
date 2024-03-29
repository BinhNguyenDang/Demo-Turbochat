module RoomsHelper
    # This method searches for public rooms based on the name_search parameter.
    # It filters out rooms that the current user has already joined.
    def search_rooms
      if params.dig(:name_search).present? && params.dig(:name_search).length > 0
        Room.public_rooms
            .where
            .not(id: current_user.joined_rooms.pluck(:id))
            .where('name ILIKE ?', "%#{params.dig(:name_search)}%")
            .order(name: :asc)
      else
        []
      end
    end

    # Method to generate a unique private room name based on two users' IDs
    # EXAMPLE : private_1_2 (room for user_id 1 and user_id 2)
    def get_name(user1, user2)
      user = [user1, user2].sort
      "private_#{user[0].id}_#{user[1].id}"
    end
  end
  