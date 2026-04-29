package com.college.stationery.repository;

import com.college.stationery.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
<<<<<<< HEAD
    Optional<User> findByResetToken(String resetToken);
=======
    Optional<User> findByResetToken(String token);
<<<<<<< HEAD
    java.util.List<User> findByRole(String role);
=======
>>>>>>> b41701ed275464c5071a51973b52548d6f152a60
>>>>>>> a8163695820187bd7b5dea38a10fa6a2dca9169a
}
